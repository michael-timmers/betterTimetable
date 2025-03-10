// ServerComponent.tsx
"use server";

import React from 'react';
import planData from './planData'; // Adjust the import path accordingly
import ClientComponent from './details'; // Adjust the import path accordingly

export default async function ServerComponent() {
    const data = await planData();

    // Render the ClientComponent with the fetched data
    return <ClientComponent data={data} />;
}
