import { describe, it, expect, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })
  it('Should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@mail.com',
      password: '123456',
    })
    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )
    expect(isPasswordCorrectlyHashed).toBe(true)
  })
  it('Should be able to register', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@mail.com',
      password: '123456',
    })
    expect(user.id).toEqual(expect.any(String))
  })
  it('Should not be able to register with the same email', async () => {
    const email = 'johndoe@mail.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: '123456',
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
