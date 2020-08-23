import hello from '.';

describe('hello', () => {
  it('returns the correct value', () => {
    expect(hello()).toMatch('hello');
  });
});
