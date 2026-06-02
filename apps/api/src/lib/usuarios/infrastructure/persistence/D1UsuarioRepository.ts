import { eq } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Usuario } from "../../domain/entities";
import { type IUsuarioRepository } from "../../domain/ports";
import { Username } from "../../domain/value-objects";
import { obtenerDb } from "../../../shared/infrastructure/persistence/drizzle";
import { usuariosTable, type UsuarioRow } from "./schema";
import { UsuarioMapper } from "./UsuarioMapper";

/** Repositorio de usuarios implementado con D1 y Drizzle. @group Persistencia */
export class D1UsuarioRepository implements IUsuarioRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    try {
      const row = await this.drizzle()
        .select()
        .from(usuariosTable)
        .where(eq(usuariosTable.id, id))
        .get();

      if (!row) {
        return null;
      }

      return UsuarioMapper.aDominio(row as UsuarioRow);
    } catch (error) {
      console.error(`Error obtenerPorId(${id}):`, error);
      throw error;
    }
  }

  async existePorId(id: string): Promise<boolean> {
    try {
      const row = await this.drizzle()
        .select({ id: usuariosTable.id })
        .from(usuariosTable)
        .where(eq(usuariosTable.id, id))
        .get();

      return !!row;
    } catch (error) {
      console.error(`Error existePorId(${id}):`, error);
      throw error;
    }
  }

  async obtenerPorUsername(username: Username): Promise<Usuario | null> {
    try {
      const row = await this.drizzle()
        .select()
        .from(usuariosTable)
        .where(eq(usuariosTable.username, username.valor))
        .get();

      if (!row) {
        return null;
      }

      return UsuarioMapper.aDominio(row as UsuarioRow);
    } catch (error) {
      console.error(`Error obtenerPorUsername(${username.valor}):`, error);
      throw error;
    }
  }

  async existePorUsername(username: Username): Promise<boolean> {
    try {
      const row = await this.drizzle()
        .select({ username: usuariosTable.username })
        .from(usuariosTable)
        .where(eq(usuariosTable.username, username.valor))
        .get();

      return !!row;
    } catch (error) {
      console.error(`Error existePorUsername(${username.valor}):`, error);
      throw error;
    }
  }

  async guardar(usuario: Usuario): Promise<void> {
    try {
      const ahora = new Date().toISOString();
      const usuarioPersistencia = UsuarioMapper.aPersistencia(usuario);

      await this.drizzle()
        .insert(usuariosTable)
        .values({
          id: usuarioPersistencia.id,
          username: usuarioPersistencia.username,
          nombre: usuarioPersistencia.nombre,
          hashClave: usuarioPersistencia.hashClave,
          rol: usuarioPersistencia.rol,
          estado: usuarioPersistencia.estado,
          creadoEn: usuarioPersistencia.creadoEn,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: usuariosTable.id,
          set: {
            username: usuarioPersistencia.username,
            nombre: usuarioPersistencia.nombre,
            hashClave: usuarioPersistencia.hashClave,
            rol: usuarioPersistencia.rol,
            estado: usuarioPersistencia.estado,
            actualizadoEn: ahora,
          },
        });
    } catch (error) {
      console.error(`Error guardar usuario(${usuario.id}):`, error);
      throw error;
    }
  }

  async eliminarPorId(id: string): Promise<void> {
    try {
      await this.drizzle().delete(usuariosTable).where(eq(usuariosTable.id, id));
    } catch (error) {
      console.error(`Error eliminarPorId(${id}):`, error);
      throw error;
    }
  }

  async listarTodos(): Promise<Usuario[]> {
    try {
      const rows = await this.drizzle().select().from(usuariosTable).orderBy(usuariosTable.id);

      return rows.map((row) => UsuarioMapper.aDominio(row as UsuarioRow));
    } catch (error) {
      console.error("Error listarTodos:", error);
      throw error;
    }
  }

  async deshabilitarPorId(id: string): Promise<void> {
    try {
      const usuario = await this.obtenerPorId(id);

      if (!usuario) {
        return;
      }

      usuario.deshabilitar();
      await this.guardar(usuario);
    } catch (error) {
      console.error(`Error deshabilitarPorId(${id}):`, error);
      throw error;
    }
  }

  async actualizarRol(id: string, nuevoRol: string): Promise<void> {
    try {
      const usuario = await this.obtenerPorId(id);

      if (!usuario) {
        return;
      }

      usuario.cambiarRol(nuevoRol);
      await this.guardar(usuario);
    } catch (error) {
      console.error(`Error actualizarRol(${id}):`, error);
      throw error;
    }
  }

  async actualizarHashClave(id: string, nuevoHash: string): Promise<void> {
    try {
      const usuario = await this.obtenerPorId(id);

      if (!usuario) {
        return;
      }

      usuario.cambiarHashClave(nuevoHash);
      await this.guardar(usuario);
    } catch (error) {
      console.error(`Error actualizarHashClave(${id}):`, error);
      throw error;
    }
  }

  async listar(): Promise<Usuario[]> {
    return this.listarTodos();
  }
}
