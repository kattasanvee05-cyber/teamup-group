import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  listListings, getListing, createListing, updateListing, deleteListing,
  myChats, startChat, getMessages, sendMessage,
} from '../controllers/exchange.controller.js';

const router = Router();

// Chat routes MUST come before /:id to avoid param conflict
router.get   ('/chats/mine',            authenticate, myChats);
router.post  ('/chats',                 authenticate, startChat);
router.get   ('/chats/:id/messages',    authenticate, getMessages);
router.post  ('/chats/:id/messages',    authenticate, sendMessage);

// Listing routes
router.get   ('/',      authenticate, listListings);
router.post  ('/',      authenticate, createListing);
router.get   ('/:id',   authenticate, getListing);
router.patch ('/:id',   authenticate, updateListing);
router.delete('/:id',   authenticate, deleteListing);

export default router;
