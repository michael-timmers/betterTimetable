type LockedSlot = {
    activity: string;
    day: string;
    time: string;
    location: string;
    unitCode: string;
};

// Store locked slots globally (to persist state)
let lockedSlotsState: LockedSlot[] = [];

export const manageSlots = (
    action: 'add' | 'remove' | 'get' | 'removeAll',
    course?: { activity: string; day: string; time: string; location: string },
    unitCode?: string,
    lockedSlots: LockedSlot[] = []
): LockedSlot[] => {
    console.log(`Action: ${action}, Course: ${JSON.stringify(course)}, UnitCode: ${unitCode}`);

    if (action === 'get') {
        console.log('Returning current locked slots:', lockedSlotsState);
        return lockedSlotsState; // Return all currently stored locked slots
    }

    if (!course || !unitCode) {
        console.warn('Invalid input: course or unitCode missing.');
        return lockedSlotsState; // Safety check
    }

    const slot = {
        activity: course.activity,
        day: course.day,
        time: course.time,
        location: course.location,
        unitCode,
    };

    let updatedLockedSlots = [...lockedSlotsState];

    if (action === 'add') {
        console.log('Attempting to add slot:', slot);

        const existingSlotIndex = updatedLockedSlots.findIndex(
            (lockedSlot) => lockedSlot.unitCode === unitCode && lockedSlot.activity === slot.activity
        );

        if (existingSlotIndex !== -1) {
            console.log(`Slot already exists for unit ${unitCode}, replacing...`);
            updatedLockedSlots.splice(existingSlotIndex, 1);
        }

        updatedLockedSlots.push(slot);
    } else if (action === 'remove') {
        console.log('Attempting to remove slot:', slot);

        updatedLockedSlots = updatedLockedSlots.filter(
            (lockedSlot) =>
                !(
                    lockedSlot.activity === slot.activity &&
                    lockedSlot.day === slot.day &&
                    lockedSlot.time === slot.time &&
                    lockedSlot.location === slot.location &&
                    lockedSlot.unitCode === slot.unitCode
                )
        );
    } else if (action === 'removeAll') {
        console.log('Attempting to remove all slots');

        // Clear the entire lockedSlotsState when 'removeAll' is called
        updatedLockedSlots = [];
    }

    // Update global state
    lockedSlotsState = updatedLockedSlots;
    console.log('Updated locked slots state:', lockedSlotsState);

    return updatedLockedSlots;
};
