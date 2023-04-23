import type { Application } from "../application";
import { EventDispatcher } from "./events";

/**
 * Component base class. This is primarily a convenience structure
 * for accessing higher level options.
 *
 * @template Owner type of component's owner.
 */
export abstract class Component<
    Owner extends Component<any, any>,
    Events extends Record<keyof Events, unknown[]> = {}
> extends EventDispatcher<Events> {
    readonly owner: Owner;
    readonly application: Application;

    constructor(owner: Owner) {
        super();
        this.owner = owner || (this as never);
        this.application = this.owner.application || (this as never);
    }
}
