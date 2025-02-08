import { NestApplication, NestFactory } from "@nestjs/core";
import { SSMModule } from "../SSM.module";
import { ASSMService } from "../ASSM.service";
import { Logger } from "@nestjs/common";
const fs = require("fs");
const path = require("path");

const log = new Logger("uploadPrompts");
let app: NestApplication;
const main = async () => {
    app = await NestFactory.create(SSMModule);
    await app.init();
    const dir = process.env.PROMPT_DIR;
    if(!dir) {
        throw new Error("PROMPT_DIR not set");
    }
    if(!fs.existsSync(dir)) {
        log.error(`PROMPT_DIR does not exist: ${dir}`);
        return;
    }
    if(fs.lstatSync(dir).isFile()) {
        log.error(`PROMPT_DIR is a file, not a directory: ${dir}`);
        return;
    }
    const files = fs.readdirSync(dir);
    for(const f of files) {
        const fullPath = path.join(dir, f);
        if(fs.lstatSync(fullPath).isDirectory()) {
            continue;
        }
        const content = fs.readFileSync(fullPath, "utf-8");
        log.log(`Uploading prompt: ${fullPath}`);
        await addPromptData(fullPath, content);
    }

}

const addPromptData = async (fPath: string, content: Buffer) => {
    const ssm = app.get(ASSMService);
    const fn = eval(content.toString());
    if(typeof fn !== 'function') {
        throw new Error(`Prompt content does not return a function: ${path}`);
    }

    const promptData = fn();
    if(!promptData) {
        throw new Error(`Prompt content function returns empty: ${path}`);
    }
    if(typeof promptData !== 'object') {
        throw new Error(`Prompt content function returns non-object: ${path}`);
    }
    if(!promptData.key) {
        throw new Error(`Prompt content function returns object without key: ${path}`);
    }
    if(!promptData.prompt) {
        throw new Error(`Prompt content function returns object without 'prompt': ${path}`);
    }
    const ssmKey = `/${promptData.key.replaceAll(".", "/")}`;
    log.log(`Adding prompt: '${ssmKey}' with value starting with '${promptData.prompt.substring(0, 100)}...'`);
    try {
        const r = await ssm.setParameter(ssmKey, promptData.prompt, true);
        const d = await ssm.getParameter(ssmKey);
        if(!d) {
            throw new Error(`Failed to upload prompt from file: ${fPath}`);
        }
        log.log(r);
    } catch (e) {
        console.log(e);
        log.error(`Failed to upload prompt from file: ${fPath}`);
    }
}

main();