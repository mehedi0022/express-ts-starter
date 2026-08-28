#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/43ee6e9a21aa986f5296e64352dd7d9b1d4a604e864481d29db114cbe5839bdf/contract';
import startContract from '../../snapshots/43ee6e9a21aa986f5296e64352dd7d9b1d4a604e864481d29db114cbe5839bdf/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b1fc22711a47d812ac24f5908f312a2d78c76506c3e4035bbd7d53a59e2ed806/contract';
import endContract from '../../snapshots/b1fc22711a47d812ac24f5908f312a2d78c76506c3e4035bbd7d53a59e2ed806/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-password', {
        check: () => placeholder('backfill-user-password:check'),
        run: () => placeholder('backfill-user-password:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'password' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
