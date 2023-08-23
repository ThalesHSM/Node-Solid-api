import { describe, it, expect, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { AuthenticateUseCase } from './authenticate'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })
  it('Should be able to authenticate', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@mail.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await sut.execute({
      email: 'johndoe2@mail.com',
      password: '123456',
    })
    expect(user.id).toEqual(expect.any(String))
  })
  it('Should not be able to authenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'johndoe@mail.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
  it('Should not be able to authenticate with wrong password', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe2@mail.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        email: 'johndoe@mail.com',
        password: '123123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
