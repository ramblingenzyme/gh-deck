/** Strip characters that are invalid in CSS identifiers (e.g. colons from useId()) */
export const cleanId = (id: string) => id.replace(/:/g, "");
