"use client"
import planData from "./planData"

export default async function details() {

    const data = await planData();
    console.log(data);
    
    return(
        <>

            <p> Random Details</p>
        </>
    )
}