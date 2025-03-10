"use client";

import React from 'react';

export default function ClientComponent({ data }: { data: { classType: string; activity: string }[] }) {
    return (
        <>
            <p>Random Details</p>
            {data.map((item, index) => (
                <div key={index}>
                    <p>Class Type: {item.classType}</p>
                    <p>Activity: {item.activity}</p>
                </div>
            ))}
        </>
    );
}
