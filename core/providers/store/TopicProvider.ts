type SchemaType = {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  Date: Date
}

type DynamicSchemaType<T extends Record<string, keyof SchemaType>> = {
  [ K in keyof T ]: SchemaType[T[K]] 
}

type DeepPartialSchema<T> = {
  - readonly [ K in keyof T ]?: T[K] extends Record<string, keyof SchemaType> 
    ? DynamicSchemaType<T[K]>
    : DeepPartialSchema<T[K]>
};



export class SchemaProvider {
  constructor() {}

  create() {
    const userSchema = {
      hi: 'hi',
      user: 'string',
      provider: {
        provider: 'string',
        version: 'number',
        createdAt: 'Date'
      }
    } as const;

    type schema = DeepPartialSchema<typeof userSchema>;

    console.log()
  }

  drop() {
    
  }
}