import composeEnhancers from '../src/composeEnhancers';
import { compose } from 'redux';

declare global {
  // eslint-disable-next-line no-var
  var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: ((options?: any) => any) | undefined;
}

describe('composeEnhancers', () => {
  it('should return default composer', () => {
    const composer = composeEnhancers({ enableDevTools: () => false });
    expect(composer).toBe(compose);
  });

  it('should throw warning', () => {
    const composer = composeEnhancers({ enableDevTools: {} as any });
    expect(composer).toBe(compose);
  });

  it('should return compose function', () => {
    const composer = composeEnhancers({ composeRedux: () => null });
    expect(composer).toBe(compose);
  });

  it('should return compose function', () => {
    function mockCompose(_composer: any) {
      return 1;
    }
    const composer = composeEnhancers({ composeRedux: () => mockCompose });
    expect(composer).toBe(mockCompose);
  });

  it('should return devTools composer', () => {
    // mock env
    const mockDevToolReturn = {};
    global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = function mockCompose() {
      return mockDevToolReturn;
    };
    (global as any).process = {
      env: {
        NODE_ENV: 'development',
      },
    };

    const composer = composeEnhancers();
    expect(composer).toBe(mockDevToolReturn);
  });

  it('should return devTools composer', () => {
    // mock env
    const mockDevToolReturn = {};
    global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = function mockCompose() {
      return mockDevToolReturn;
    };

    const composer = composeEnhancers({ enableDevTools: () => true });
    expect(composer).toBe(mockDevToolReturn);
  });
});
