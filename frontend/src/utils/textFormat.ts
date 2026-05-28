export const formatTitleCase = (text: string) =>
  text.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
