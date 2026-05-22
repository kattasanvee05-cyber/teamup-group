import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  listBooks, listEquipment, myBorrows, createBorrow, returnItem,
  startBorrowChat, getBorrowMessages, sendBorrowMessage,
  createBook, createEquipment, getMyItems,
} from '../controllers/studies.controller.js';

const router = Router();

router.get ('/books',                   authenticate, listBooks);
router.post('/books',                   authenticate, createBook);
router.get ('/equipment',               authenticate, listEquipment);
router.post('/equipment',               authenticate, createEquipment);
router.get ('/borrows/mine',            authenticate, myBorrows);
router.post('/borrow',                  authenticate, createBorrow);
router.patch('/borrows/:id/return',     authenticate, returnItem);

router.post('/chat',                    authenticate, startBorrowChat);
router.get ('/chat/:id/messages',       authenticate, getBorrowMessages);
router.post('/chat/:id/messages',       authenticate, sendBorrowMessage);

router.get ('/my-items',                authenticate, getMyItems);

export default router;
