import { cn } from "@/lib/utils";
import { useEffect, useState } from 'react';
import { useEffectiveTheme, useTheme } from "./theme-provider";

function Plant({ className, }: { className?: string }) {

    const theme = useEffectiveTheme();
    const fillColor = theme === 'dark' ? 'fill-[#000000]' : 'fill-[#ffffff]';

    return (
        <svg className={
            cn(
                `${fillColor} w-[100%] stroke-green-800 stroke-[3px] absolute origin-bottom transition duration-1000 transform logo-animated delay-500`,
                className,
            )
        }
            viewBox="0 0 67.733 67.733">
            <path d="M102.313 163.667c3.797.317 6.33 1.218 7.753 2.302 1.423 1.085 3.442 3.297 4.394 6.196M102.305 163.668c.066 2.173-2.657 3.762-4.69 3.673-2.034-.088-4.258-1.168-6.079-3.793 1.416-1.412 3.205-3.63 6.09-3.512 2.883.119 4.613 1.46 4.679 3.632zM114.442 143.03l.119 36.574M123.053 129.978c0 6.323-8.617 13.053-8.617 13.053s-8.017-6.56-8.017-13.04c0-6.78 4.761-11.147 8.245-13.622 3.328 2.527 8.389 6.944 8.389 13.609zM102.313 147.1c3.797.316 6.33 1.217 7.753 2.301 1.423 1.085 3.442 3.297 4.394 6.196M102.305 147.1c.066 2.173-2.657 3.762-4.69 3.674-2.034-.089-4.258-1.169-6.079-3.794 1.416-1.412 3.205-3.63 6.09-3.512 2.883.119 4.613 1.46 4.679 3.633zM126.73 147.1c-3.798.316-6.331 1.217-7.754 2.301-1.423 1.085-3.441 3.297-4.393 6.196M126.737 147.1c-.065 2.173 2.658 3.762 4.69 3.674 2.034-.089 4.259-1.169 6.08-3.794-1.417-1.412-3.205-3.63-6.09-3.512-2.884.119-4.614 1.46-4.68 3.633zM126.73 163.696c-3.798.317-6.331 1.217-7.754 2.302-1.423 1.084-3.441 3.296-4.393 6.196M126.737 163.697c-.065 2.173 2.658 3.761 4.69 3.673 2.034-.088 4.259-1.168 6.08-3.794-1.417-1.412-3.205-3.63-6.09-3.511-2.884.118-4.614 1.46-4.68 3.632z" transform="translate(-80.655 -113.375)" />
        </svg>
    );
}

export function Logo({ className }: { className?: string }) {

    const [shouldAnimate, setShouldAnimate] = useState(false);


    useEffect(() => {
        // Trigger the animation shortly after the component mounts
        const timer = setTimeout(() => {
            setShouldAnimate(true);
        }, 500); // Add a slight delay to ensure DOM is ready

        return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

    const svgClasses = 
        cn(className,
            shouldAnimate ? 'scale-100' : 'scale-0',
        );

    return (
        <Plant className={svgClasses} />
    );
}