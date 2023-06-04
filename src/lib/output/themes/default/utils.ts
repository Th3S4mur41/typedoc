import {
    DeclarationReflection,
    ProjectReflection,
    ReflectionCategory,
    ReflectionGroup,
    ReflectionKind,
} from "../../../models";
import type { NavigationOptions } from "../../../utils/options/declaration";

export type NavigationElement =
    | ReflectionCategory
    | ReflectionGroup
    | DeclarationReflection;

export function getNavigationElements(
    parent: NavigationElement | ProjectReflection,
    opts: NavigationOptions
): NavigationElement[] {
    if (parent instanceof ReflectionCategory) {
        return parent.children;
    }

    if (parent instanceof ReflectionGroup) {
        if (opts.includeCategories && parent.categories) {
            return parent.categories;
        }
        return parent.children;
    }

    if (!parent.kindOf(ReflectionKind.SomeModule | ReflectionKind.Project)) {
        return [];
    }

    if (parent.categories && opts.includeCategories) {
        return parent.categories;
    }

    if (parent.groups && opts.includeGroups) {
        return parent.groups;
    }

    return parent.children || [];
}
