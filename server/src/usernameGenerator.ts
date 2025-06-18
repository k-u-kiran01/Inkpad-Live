function generateUsername(input: string): string {
    const words = input.trim().split(/[ .,-]+/).filter(Boolean);

    // Pick the longest word available or fallback to "user"
    let baseWord = words.length ? words.reduce((a, b) => (a.length > b.length ? a : b)) : "user";

    // Generate a random number between 10 and 99999 (2 to 5 digits)
    const randomNum = Math.floor(10 + Math.random() * 99990);

    // Ensure length is between 4 and 12 characters
    let username = (baseWord + randomNum).substring(0, 12);
    if (username.length < 4) {
        username = username.padEnd(4, "0"); // Extend with '0' if too short
    }
    return username;
}
 export default generateUsername