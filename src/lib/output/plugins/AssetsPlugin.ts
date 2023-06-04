import { Component, RendererComponent } from "../components";
import { RendererEvent } from "../events";
import { copySync, writeFileSync } from "../../utils/fs";
import { DefaultTheme } from "../themes/default/DefaultTheme";
import { getStyles } from "../../utils/highlighter";
import { BindOption } from "../../utils";
import { existsSync } from "fs";
import { join } from "path";
import { ProjectReflection, Reflection } from "../../models";
import {
    NavigationElement,
    getNavigationElements,
} from "../themes/default/utils";
import type { NavigationOptions } from "../../utils/options/declaration";

/**
 * A plugin that copies the subdirectory ´assets´ from the current themes
 * source folder to the output directory.
 */
@Component({ name: "assets" })
export class AssetsPlugin extends RendererComponent {
    /** @internal */
    @BindOption("customCss")
    customCss!: string;

    @BindOption("navigation")
    navigationOpts!: NavigationOptions;

    /**
     * Create a new AssetsPlugin instance.
     */
    override initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.END]: this.onRenderEnd,
            [RendererEvent.BEGIN]: (event: RendererEvent) => {
                const dest = join(event.outputDirectory, "assets");

                if (this.customCss) {
                    if (existsSync(this.customCss)) {
                        copySync(this.customCss, join(dest, "custom.css"));
                    } else {
                        this.application.logger.error(
                            `Custom CSS file at ${this.customCss} does not exist.`
                        );
                        event.preventDefault();
                    }
                }
            },
        });
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    private onRenderEnd(event: RendererEvent) {
        if (this.owner.theme instanceof DefaultTheme) {
            const src = join(__dirname, "..", "..", "..", "..", "static");
            const dest = join(event.outputDirectory, "assets");
            copySync(src, dest);

            writeFileSync(join(dest, "highlight.css"), getStyles());

            writeFileSync(
                join(dest, "navigation.js"),
                getNavigationJs(event.project, this.navigationOpts)
            );
        }
    }
}

// Keep this in sync with NavData defined in Navigation.ts
interface NavData {
    text: string;
    link?: string;
    children?: NavData[];
}

function getName(element: NavigationElement) {
    if (element instanceof Reflection) {
        return element.name;
    }
    return element.title;
}

function getLink(element: NavigationElement) {
    if (element instanceof Reflection) return element.url;
}

function getNavigationStructure(
    element: NavigationElement,
    opts: NavigationOptions
): NavData {
    const children = getNavigationElements(element, opts);
    if (!children.length) {
        return {
            text: getName(element),
            link: getLink(element),
        };
    }

    return {
        text: getName(element),
        link: getLink(element),
        children: children.map((child) => getNavigationStructure(child, opts)),
    };
}

function getNavigationJs(project: ProjectReflection, opts: NavigationOptions) {
    const elements = getNavigationElements(project, opts).map((el) =>
        getNavigationStructure(el, opts)
    );

    return `window.navigationData = JSON.parse(${JSON.stringify(
        JSON.stringify(elements)
    )});`;
}
