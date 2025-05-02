

export const convertDate = (dateString, timeFormateType) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    if(timeFormateType) {
        if(timeFormateType === "12") {
            options.hour12 = true;
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
        else if(timeFormateType === "24") {
            options.hour12 = false;
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
    }
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
}