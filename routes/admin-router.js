import express from 'express';
import { getAllUsers, getAllEvents, addEvents, updateEvent, deleteEvent } from '../controller/admin-controller.js'; // Ensure all necessary functions are imported

// import authMiddleware from '../middlewares/auth-middleware.js'; // Uncomment and use if you have authentication middleware

const router = express.Router();

// Define routes
router.route('/users')
    .get(getAllUsers);

router.route('/events')
    .get(getAllEvents)
    .post(addEvents);

router.route('/events/:id')
    .put(updateEvent)
    .delete(deleteEvent);

// Example protected route (uncomment authMiddleware if using authentication)
// router.get('/protected-route', authMiddleware, (req, res) => {
//     res.send("This is a protected route.");
// });

// Example of an unprotected route
router.get('/protected-route', (req, res) => {
    res.send("This is a protected route.");
});

// Export the router
export default router;
