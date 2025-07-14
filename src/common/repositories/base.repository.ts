import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { HttpNotFoundException } from 'src/common/errors';
import {
  ERROR_CODE,
  RESPONSE_ERROR_MESSAGE,
} from 'src/common/consts/messages.const';

interface IBaseEntity {
  id: number;
}

export abstract class BaseRepository<T extends IBaseEntity> {
  constructor(private entityRepository: Repository<T>) { }
  async create(data: DeepPartial<T>, transaction?: EntityManager): Promise<T> {
    const entity = this.entityRepository.create(data);
    return transaction
      ? await transaction.save(this.entityRepository.target, entity)
      : await this.entityRepository.save(entity);
  }

  async save(data: DeepPartial<T>, transaction?: EntityManager): Promise<T> {
    return transaction
      ? await transaction.save(this.entityRepository.target, data)
      : await this.entityRepository.save(data);
  }

  async createBatch(
    data: DeepPartial<T>[],
    transaction?: EntityManager,
  ): Promise<T[]> {
    const entities = this.entityRepository.create(data);
    return transaction
      ? await transaction.save(entities)
      : await this.entityRepository.save(entities);
  }

  async upsert(
    data: QueryDeepPartialEntity<T>,
    conflictPaths: string[],
    transaction?: EntityManager,
  ): Promise<T> {
    const result = transaction
      ? await transaction.upsert(
        this.entityRepository.target,
        data,
        conflictPaths,
      )
      : await this.entityRepository.upsert(data, conflictPaths);

    return result.raw[0];
  }
  async update(
    toUpdate: T,
    data: DeepPartial<T>,
    transaction?: EntityManager,
  ): Promise<T> {
    const entity = {
      ...toUpdate,
      ...data,
    };
    return transaction
      ? await transaction.save(this.entityRepository.target, entity)
      : await this.entityRepository.save(entity);
  }

  async updateBatch(
    entities: T[],
    data: DeepPartial<T>[],
    transaction?: EntityManager,
  ): Promise<T[]> {
    const updatedEntities = entities.map((entity, index) => {
      return this.entityRepository.merge(entity, data[index]);
    });

    return transaction
      ? await transaction.save(updatedEntities)
      : await this.entityRepository.save(updatedEntities);
  }

  async findOneById(id: number): Promise<T> {
    const option = { id };
    return await this.entityRepository.findOneBy(option as FindOptionsWhere<T>);
  }

  async findOneByCondition(filter: FindOneOptions<T>): Promise<T> {
    return await this.entityRepository.findOne(filter);
  }
  async findOneByConditionOrFail(
    filter: FindOneOptions<T>,
    failReason?: { message: string; code: string },
  ): Promise<T | never> {
    const result = await this.findOneByCondition(filter);
    if (!failReason) {
      failReason = {
        message: `${result?.constructor?.name} ${RESPONSE_ERROR_MESSAGE.NOT_FOUND}`,
        code: ERROR_CODE.NOT_FOUND,
      };
    }
    if (!result)
      throw new HttpNotFoundException(failReason.message, failReason.code);
    return result;
  }
  async findAll(options: FindManyOptions<T>): Promise<T[]> {
    return await this.entityRepository.find(options);
  }

  async count(options: FindManyOptions<T>): Promise<number> {
    return await this.entityRepository.count(options);
  }

  async remove(
    id: number | number[],
    cascadeRelations?: string[],
    transaction?: EntityManager,
  ): Promise<boolean> {
    let result: any;
    const option = { id };
    if (cascadeRelations?.length > 0) {
      const entity = await this.entityRepository.findOne({
        where: option as FindOptionsWhere<T>,
        relations: cascadeRelations,
      });
      result = transaction
        ? await transaction.softRemove(entity)
        : await this.entityRepository.softRemove(entity);
    } else {
      const { affected } = transaction
        ? await transaction.softDelete(this.entityRepository.target, id)
        : await this.entityRepository.softDelete(id);
      result = affected;
    }
    return !!result;
  }

  async removeByCondition(
    filter: FindOptionsWhere<T>,
    transaction?: EntityManager,
  ): Promise<boolean> {
    const { affected } = transaction
      ? await transaction.softDelete(this.entityRepository.target, filter)
      : await this.entityRepository.softDelete(filter);
    return !!affected;
  }
  async removeCascadeByCondition(
    filter: FindOptionsWhere<T>,
    cascadeRelations?: string[],
    transaction?: EntityManager,
  ) {
    const manager: EntityManager = transaction || this.entityRepository.manager;
    const entity = await this.entityRepository.find({
      where: filter,
      relations: cascadeRelations,
    });

    const result = await manager.softRemove(entity);
    return !!result;
  }

  async updateWhere(
    criteria: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
    transaction?: EntityManager,
  ) {
    if (transaction)
      return transaction.update(
        this.entityRepository.target,
        criteria,
        partialEntity,
      );
    return this.entityRepository.update(criteria, partialEntity);
  }

  queryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): SelectQueryBuilder<T> {
    return this.entityRepository.createQueryBuilder(alias, queryRunner);
  }
}
