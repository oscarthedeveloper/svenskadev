import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateHomepage,selectFeaturedArticles,DEFAULT_HOMEPAGE_TEXT} from '../lib/homepage-model.ts';
test('startsidan kräver korta rubriker och olika artikelval',()=>{
  const page={...DEFAULT_HOMEPAGE_TEXT,featuredIds:['one','two']};
  assert.equal(validateHomepage(page),null);
  assert.match(validateHomepage({...page,headline:'x'.repeat(25)}),/headline/);
  assert.match(validateHomepage({...page,featuredIds:['one','one']}),/olika/);
  assert.match(validateHomepage({...page,featuredIds:[]}),/Välj/);
});
test('urvalet bevarar ordningen och utesluter avpublicerade eller borttagna artiklar',()=>{
  const first={id:'one',href:'/sprakrad/one',title:'En',section:'Språkråd'};
  const second={id:'two',href:'/sprakrad/two',title:'Två',section:'Språkråd'};
  assert.deepEqual(selectFeaturedArticles(['two','deleted','one','two'],[first,second]),[second,first]);
  assert.deepEqual(selectFeaturedArticles(['one'],[]),[]);
});
