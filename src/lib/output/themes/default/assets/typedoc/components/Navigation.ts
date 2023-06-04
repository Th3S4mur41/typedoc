// Keep this in sync with NavData defined in AssetsPlugin.ts
interface NavData {
    text: string;
    link: string;
    children?: NavData[];
}

declare global {
    interface Window {
        navigationData?: NavData[];
    }
}

export function initNavigation() {
    const navEl = document.querySelector<HTMLElement>(
        "[data-navigation-update]"
    );
    if (!navEl) return;

    const navScript = document.getElementById(
        "tsd-navigation-script"
    ) as HTMLScriptElement | null;

    if (navScript) {
        // navScript.addEventListener("load", () =>
        //     updateNavigation(
        //         navScript.dataset.base!,
        //         navEl,
        //         window.navigationData!
        //     )
        // );
        // if (window.navigationData) {
        //     updateNavigation(
        //         navScript.dataset.base!,
        //         navEl,
        //         window.navigationData
        //     );
        // }
    }
}

function updateNavigation(base: string, navLi: HTMLElement, navData: NavData) {
    if (!navData.children) {
        // No need to expand
        return;
    }

    if (navLi.firstElementChild?.tagName === "DETAILS") {
        // This page does not need to be expanded, or is already expanded
        // since the user is on a child page of this element.
        // Need to loop over children too in case there are nested namespaces
        const ul = navLi.querySelector("ul")!;
        for (let i = 0; i < navData.children.length; i++) {
            updateNavigation(
                base,
                ul.children[i] as HTMLElement,
                navData.children[i]
            );
        }
        return;
    }

    // Otherwise, this navigation element should be a details/nested nav, but was
    // rendered with just a link to save on file size, so now we need to replace
    // this element with the tree. Unfortunately
}
