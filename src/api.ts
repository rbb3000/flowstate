import fetch from "node-fetch";
import { baseUrl } from "./constants";


export const updateSlack = async (userId: string, time:number) => {
    await fetch(baseUrl + `/update/slackstatus?userid=${userId}&status=DeepWork&snoozetime=${time}`);
};