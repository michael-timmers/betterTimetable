"use server";

import React from 'react';
import planData from './planData'; // Make sure planData is a function returning a promise
import ClientComponent from './details'; // Adjust import path accordingly

export default async function ServerComponent() {
    // Assuming planData is an async function that returns data
    const data = await planData(); 

    // Render the ClientComponent with the fetched data
    return <ClientComponent data={data} />;
}
