import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  updateBooking,
  remindPendingBookings,
  deleteUnconfirmedBookings,
} from "../controllers/bookingController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post("/", authenticate, authorize(["customer"]), createBooking);
router.get("/", authenticate, authorize(["customer"]), getMyBookings);
router.put("/:id", authenticate, authorize(["customer"]), updateBooking);

// Made it public because this will be done by a script in a clonejob.
router.post("/reminder", remindPendingBookings);
router.post("/deleteNonConfirmed", deleteUnconfirmedBookings);

export default router;
