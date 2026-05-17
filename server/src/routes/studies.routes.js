import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  listBooks, listEquipment, myBorrows, createBorrow, returnItem,
  startBorrowChat, getBorrowMessages, sendBorrowMessage,
} from '../controllers/studies.controller.js';

const router = Router();

router.get ('/books',                   authenticate, listBooks);
router.get ('/equipment',               authenticate, listEquipment);
router.get ('/borrows/mine',            authenticate, myBorrows);
router.post('/borrow',                  authenticate, createBorrow);
router.patch('/borrows/:id/return',     authenticate, returnItem);

router.post('/chat',                    authenticate, startBorrowChat);
router.get ('/chat/:id/messages',       authenticate, getBorrowMessages);
router.post('/chat/:id/messages',       authenticate, sendBorrowMessage);

export default router;
