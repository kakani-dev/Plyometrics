// Import Dependencies
// Local Imports
import { assignRef } from 'utils/dom/assignRef';

// ----------------------------------------------------------------------

function mergeRefs(...refs) {
    return (node) => {
        refs.forEach((ref) => assignRef(ref, node));
    };
}

function useMergedRef(...refs) {
    return mergeRefs(...refs);
}

export { assignRef, mergeRefs, useMergedRef }
