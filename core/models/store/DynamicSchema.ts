export type SchemaTypes<T> = {
  [ K in keyof T ]: T[K]
}

export type DynamicSchema<T extends Record<string, keyof SchemaTypes<any>>> = {
  -readonly [K in keyof T]: SchemaTypes<any>[T[K]]
}