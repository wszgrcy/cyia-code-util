import { CssSelectorBase } from './css-selector-base';
import { AttributeSelector } from 'css-what';
interface MockNode {
    attrs?: { [name: string]: { value: string } };
    tag: string;
    children?: MockNode[];
}
class MockCssSelector extends CssSelectorBase<MockNode, MockNode> {
    constructor(protected parseTree: MockNode) {
        super();
    }
    findTag(name, node: MockNode) {
        return name === node.tag;
    }
    getChildren(node: MockNode) {
        return node.children || [];
    }
    getQueryNode(node) {
        if (node) {
            return node;
        }
        return this.parseTree;
    }
    getTagAttribute(selector: AttributeSelector, node: MockNode) {
        return node.attrs && node.attrs[selector.name];
    }
}

const mockNode: MockNode = {
    tag: '__root',
    children: [
        { tag: 'div', attrs: { class: { value: 'test' }, id: { value: 'mock' } }, children: [{ tag: 'p', children: [{ tag: 'code' }] }] },
        { tag: 'span' },
    ],
};
describe('选择器基类', () => {
    let selector: MockCssSelector = new MockCssSelector(mockNode);
    // beforeEach(() => {})
    it('初始化', () => {
        expect(selector).toBeTruthy();
    });
    it('标签查询', () => {
        let result = selector.query('div');
        // console.log(result)
        expect(result.length).toBe(1);
    });
    it('~', () => {
        let result = selector.query('div~span');

        expect(result.length).toBe(1);
        expect(result[0].tag === 'span').toBeTrue();
    });
    it('>', () => {
        let result = selector.query('div>p');

        expect(result.length).toBe(1);
        expect(result[0].tag === 'p').toBeTrue();
    });
    it(',', () => {
        let result = selector.query('div,span');

        expect(result.length).toBe(2);
    });
    it('attribute equal', () => {
        let result = selector.query('div[id=mock]');

        expect(result.length).toBe(1);
        expect(result[0].tag === 'div').toBeTruthy();
        expect(result[0].attrs['id']).toBeTruthy();
        expect(result[0].attrs['id'].value == 'mock').toBeTruthy();
    });
    it('attribute exist', () => {
        let result = selector.query('div[id]');

        expect(result.length).toBe(1);
        expect(result[0].tag === 'div').toBeTruthy();
        expect(result[0].attrs['id']).toBeTruthy();
    });
    it('attribute any', () => {
        let result = selector.query('div[id*=mo]');

        expect(result.length).toBe(1);
        expect(result[0].tag === 'div').toBeTruthy();
        expect(result[0].attrs['id']).toBeTruthy();
        expect(result[0].attrs['id'].value == 'mock').toBeTruthy();
    });
    it('.class', () => {
        let result = selector.query('div.test');
        expect(result.length).toBe(1);
        expect(result[0].tag === 'div').toBeTruthy();
        expect(result[0].attrs['class']).toBeTruthy();
        expect(result[0].attrs['class'].value === 'test').toBeTruthy();
    });
    it('#id', () => {
        let result = selector.query('#mock');
        expect(result.length).toBe(1);
        expect(result[0].tag === 'div').toBeTruthy();
        expect(result[0].attrs['id']).toBeTruthy();
        expect(result[0].attrs['id'].value === 'mock').toBeTruthy();
    });
    it('通过返回的element进行查询', () => {
        let result = selector.query('div.test');
        expect(result.length).toBe(1);
        result = selector.query(result[0], 'p');
        expect(result.length).toBe(1);
        expect(result[0].tag).toBe('p');
    });
    it('a b c', () => {
        let result = selector.query('div  p code');
        expect(result.length).toBe(1);
        expect(result[0].tag === 'code').toBeTruthy();
    });
    it('复杂选择', () => {
        let result = selector.query('div#mock.test[class=test][id=mock] p');
        expect(result.length).toBe(1);
        expect(result[0].tag === 'p').toBeTruthy();
    });
    it('不应该选中', () => {
        expect(selector.query('div .test').length).toBe(0);
        expect(selector.query('div [class=test]').length).toBe(0);
        expect(selector.query('div #mock').length).toBe(0);
        expect(selector.query('div>#mock').length).toBe(0);
        expect(selector.query('div+#mock').length).toBe(0);
        expect(selector.query('div~#mock').length).toBe(0);
    });
});