import createModule, { generateId } from '../src/createModule';
import createStore from '../src/createStore';
import testModule from './testModule';

describe('createModule', () => {
  it('should create module with uuid', () => {
    const module = createModule(testModule);
    expect(module.id).toBeTruthy();
    expect(typeof module.getSelector()).toBe('function');
    expect(module.getSelector()()).toBe(null);
  });

  it('should return correct module name', () => {
    const module = createModule(testModule);
    const store = createStore({ userModule: module });
    expect(module.id).toBeTruthy();
    expect(module.getName()).toBe('userModule');
  });

  it('should return correct module selector', () => {
    const module = createModule(testModule);
    const store = createStore({ userModule: module });
    const selector = module.getSelector();
    expect(selector({ userModule: { hi: 1 } })).toEqual({ hi: 1 });
  });

  it('should return random and unique id', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId()).not.toBe(generateId());
  });
});
