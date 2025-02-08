import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { BreadcrumbsContext } from "@/routes/__root"
import { Link, useRouterState } from "@tanstack/react-router"
import React from "react"

type BreadcrumbItem = {
    label: string
    path?: string
}

export interface BreadcrumbsProps {
    className?: string
}

export function Breadcrumbs(props: BreadcrumbsProps) {
    const { className } = props;

    let breadcrumbs: BreadcrumbsContext[] | undefined = undefined;

    try {
        const matches = useRouterState({ select: (state) => state.matches });

        breadcrumbs = React.useMemo(() => (matches.at(-1)?.context)?.breadcrumbs, [matches]);
    } catch (e) {

    }

    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }

    const crumbs = breadcrumbs.map((link: BreadcrumbItem, index: number) => (
        <BreadcrumbItem key={'b-' + index}>
            <BreadcrumbLink asChild={true}>
                <Link to={link.path || '/'}>{link.label}</Link>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ));

    const crumbsWithSeparators = crumbs.reduce((acc, crumb, index) => {
        if (index > 0) {
            acc.push(<BreadcrumbSeparator key={'s-' + index} />);
        }
        acc.push(crumb);
        return acc;
    }, [] as JSX.Element[]);

    return (
        <Breadcrumb className={className}>
            <BreadcrumbList >
                {crumbsWithSeparators}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
