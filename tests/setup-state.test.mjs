import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyDatabaseSetup } from '../lib/supabase/setup-state.ts';
test('bara en saknad svenska_settings-tabell behandlas som nyinstallation', () => {
  assert.deepEqual(classifyDatabaseSetup(null,{code:'PGRST205',message:"Could not find the table 'public.svenska_settings' in the schema cache"}),{status:'needs-migration',initialized:false});
  for (const error of [{code:'42501'}, {code:'PGRST116'}, {code:'PGRST205',message:'annan tabell'}, {message:'network failed'}]) {
    assert.equal(classifyDatabaseSetup(null,error).status,'unavailable');
  }
  assert.deepEqual(classifyDatabaseSetup({initialized:true},null),{status:'ready',initialized:true});
  assert.deepEqual(classifyDatabaseSetup({initialized:false},null),{status:'ready',initialized:false});
});
