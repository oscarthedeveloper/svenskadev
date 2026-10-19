import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDocument, isSafeSourceUrl } from '../lib/editorial.ts';

test('källor accepterar webb-adresser men avvisar script och inbäddade lösenord', () => {
  assert.equal(isSafeSourceUrl('https://frageladan.isof.se/faqs/25461'),true);
  for (const value of ['javascript:alert(1)','data:text/html,test','https://user:password@example.com','example.com',null]) assert.equal(isSafeSourceUrl(value),false);
  const document = {title:'Artikel', subtitle:'', period:'',category:'',intro:'Ingress',sections:[],sources:[{title:'Källa',url:'javascript:alert(1)'}]};
  assert.match(validateDocument(document),/Varje källa/);
  assert.equal(validateDocument({...document,sources:[{title:'Källa',url:'https://isof.se'}]}),null);
  assert.match(validateDocument({...document,title:' '}),/Titeln/);
});
