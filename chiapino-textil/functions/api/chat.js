import { handle } from '../../server/chat-core.js';
export const onRequestPost = context => handle(context.request, context.env, p => context.waitUntil(p));
