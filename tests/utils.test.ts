import { midpoint, segmentIntersectRectangle } from '../src/utils';

test('find midpoint of segment', () => {
  expect(midpoint(0, 0, 10, 10)).toStrictEqual({ x: 5, y: 5 });
  expect(midpoint(0, 0, 0, 10)).toStrictEqual({ x: 0, y: 5 });
  expect(midpoint(10, 10, 0, 0)).toStrictEqual({ x: 5, y: 5 });
});

test('find collision between segment and rectangle', () => {
  let p1 = { x: 0, y: 5 };
  let p2 = { x: 15, y: 5 };
  let x = 0;
  let y = 0;
  let w = 10;
  let h = 10;

  expect(
    segmentIntersectRectangle(p1, p2, x, y, w, h)
  ).toStrictEqual( true );
});
