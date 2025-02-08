import { useContext } from "react";
import { SebuClientContext } from "../context/SebuClient.provider";

export const useSebuClient = () => {
    const { client } = useContext(SebuClientContext);
    return client;
}