import Now from '../src/index';

test('expect to return Date', () => {
  const now = new Now(2017, 10, 10, 10, 10, 10, 100);
  expect(now.Date()).toBe(10);
});

