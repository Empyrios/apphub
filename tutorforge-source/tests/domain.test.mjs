import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,validate,parsePrice,fee,validDate,validTime,financeSummary,overview,studentProgress,deleteStudent,exportSessionsCsv,createDemo} from '../site/domain.mjs';

test('safe empty state and demo are valid',()=>{assert.equal(validate(initial()).version,1);assert.equal(validate(createDemo()).students.length,2)});
test('GBP money input is exact',()=>{assert.equal(parsePrice('40'),4000);assert.equal(parsePrice('£40'.replace('£','')),4000);assert.equal(parsePrice('1,234.56'),123456);for(const bad of ['1.999','-1','5e3','Infinity',''])assert.throws(()=>parsePrice(bad))});
test('duration fees round to nearest penny',()=>{assert.equal(fee(4000,90),6000);assert.equal(fee(3999,45),2999);assert.equal(fee(1,30),1)});
test('date and time validation catches rollover',()=>{assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('2027-02-29'),false);assert.equal(validTime('23:59'),true);assert.equal(validTime('24:00'),false)});
test('earnings separate unpaid from collected',()=>{const demo=createDemo();const sum=financeSummary(demo);assert.deepEqual([sum.earned,sum.collected,sum.outstanding,sum.sessions],[6000,0,6000,1]);demo.sessions[0].paid=true;assert.deepEqual([financeSummary(demo).earned,financeSummary(demo).collected,financeSummary(demo).outstanding],[6000,6000,0])});
test('upcoming lessons and submitted homework are filtered',()=>{const s=createDemo();const metrics=overview(s,s.sessions[0].date);assert.equal(metrics.upcoming.length,1);s.homework[0].status='submitted';assert.equal(overview(s,s.sessions[0].date).needsReview.length,1)});
test('progress score ignores ungraded homework',()=>{const s=createDemo();assert.equal(studentProgress(s,'demo_a').averageScore,null);s.homework[0].score=80;s.homework[0].status='reviewed';assert.equal(studentProgress(s,'demo_a').averageScore,80)});
test('invalid foreign keys and duplicate IDs are rejected',()=>{const s=createDemo();s.sessions[0].studentId='missing';assert.throws(()=>validate(s));const a=createDemo();a.students.push({...a.students[0]});assert.throws(()=>validate(a))});
test('paid lessons must be completed',()=>{const s=createDemo();s.sessions[1].paid=true;assert.throws(()=>validate(s))});
test('homework cannot be due before assigned',()=>{const s=createDemo();s.homework[0].dueAt='2020-01-01';assert.throws(()=>validate(s))});
test('deleting a student cascades only their related records',()=>{const s=createDemo();assert.equal(deleteStudent(s,'demo_a'),true);assert.equal(s.students.length,1);assert.equal(s.sessions.length,1);assert.equal(s.homework.length,0)});
test('CSV handles formula injection',()=>{const s=createDemo();s.sessions[0].topic='=1+1';const csv=exportSessionsCsv(s);assert.ok(csv.includes('"\'=1+1"'));assert.equal(csv.split('\r\n').length,4)});
test('backup schema version and field size are enforced',()=>{assert.throws(()=>validate({...initial(),version:9}));const s=createDemo();s.students[0].name='X'.repeat(101);assert.throws(()=>validate(s))});
