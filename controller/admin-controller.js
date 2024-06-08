import { User } from '../models/UserSchema.js';
import { Events } from '../models/EventsSchema.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await Events.find();
        if (!events || events.length === 0) {
            return res.status(404).json({ message: "No events found" });
        }
        return res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const addEvents = async (req, res, next) => {
    try {
        const event = req.body;
        const newEvent = new Events(event);
        await newEvent.save();
        res.status(201).json({ message: 'Event inserted successfully', event: newEvent });
    } catch (error) {
        console.error('Error inserting event:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const updatedEvent = await Events.findByIdAndUpdate(eventId, req.body, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

export const deleteEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const deletedEvent = await Events.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
