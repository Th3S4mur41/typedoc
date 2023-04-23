import * as Path from "path";

import { ProjectReflection, Reflection } from "../models/reflections/index";
import { RendererEvent, PageEvent } from "./events";
import type { Renderer } from ".";
import { Component } from "../utils";

/**
 * A plugin for the renderer that reads the current render context.
 */
export abstract class ContextAwareRendererComponent extends Component<Renderer> {
    /**
     * The project that is currently processed.
     */
    protected project?: ProjectReflection;

    /**
     * The reflection that is currently processed.
     */
    protected page?: PageEvent<Reflection>;

    /**
     * The url of the document that is being currently generated.
     * Set when a page begins rendering.
     */
    private location!: string;

    /**
     * Regular expression to test if a string looks like an external url.
     */
    protected urlPrefix = /^(http|ftp)s?:\/\//;

    /**
     * Create a new ContextAwareRendererPlugin instance.
     *
     * @param renderer  The renderer this plugin should be attached to.
     */
    constructor(renderer: Renderer) {
        super(renderer);
        renderer.on(RendererEvent.BEGIN, this.onBeginRenderer.bind(this));
        renderer.on(PageEvent.BEGIN, this.onBeginPage.bind(this));
    }

    /**
     * Transform the given absolute path into a relative path.
     *
     * @param absolute  The absolute path to transform.
     * @returns A path relative to the document currently processed.
     */
    public getRelativeUrl(absolute: string): string {
        if (this.urlPrefix.test(absolute)) {
            return absolute;
        } else {
            const relative = Path.relative(
                Path.dirname(this.location),
                Path.dirname(absolute)
            );
            return Path.join(relative, Path.basename(absolute)).replace(
                /\\/g,
                "/"
            );
        }
    }

    /**
     * Triggered before the renderer starts rendering a project.
     *
     * @param event  An event object describing the current render operation.
     */
    protected onBeginRenderer(event: RendererEvent) {
        this.project = event.project;
    }

    /**
     * Triggered before a document will be rendered.
     *
     * @param page  An event object describing the current render operation.
     */
    protected onBeginPage(page: PageEvent) {
        this.location = page.url;
        if (page.model instanceof Reflection) {
            this.page = page as PageEvent<Reflection>;
        }
    }
}
