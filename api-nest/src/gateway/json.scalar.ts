import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

const parseLiteralValue = (ast: ValueNode): unknown => {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.OBJECT:
      return ast.fields.reduce<Record<string, unknown>>((value, field) => {
        value[field.name.value] = parseLiteralValue(field.value);
        return value;
      }, {});
    case Kind.LIST:
      return ast.values.map(parseLiteralValue);
    case Kind.NULL:
      return null;
    default:
      return null;
  }
};

@Scalar('JSON', () => Object)
export class JsonScalar implements CustomScalar<unknown, unknown> {
  description = 'Arbitrary JSON value';

  parseValue(value: unknown): unknown {
    return value;
  }

  serialize(value: unknown): unknown {
    return value;
  }

  parseLiteral(ast: ValueNode): unknown {
    return parseLiteralValue(ast);
  }
}
