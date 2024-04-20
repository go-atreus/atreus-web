import { request } from 'umi';
import type {
  SysUserDto,
  SysUserPassDto,
  SysUserQo,
  SysUserScopeDto,
  SysUserScopeVo,
  SysUserVo,
} from '@/services/ballcat/system/typing';
import type { PageResult, QueryParam, R } from '@/typings';

export async function query(body: QueryParam<SysUserQo>) {
  return request<R<PageResult<SysUserVo>>>('/api/system/user/list', {
    method: 'POST',
    data: body,
  });
}

export async function create(body: SysUserDto) {
  return request<R<any>>('system/user', {
    method: 'POST',
    data: body,
  });
}

export async function edit(body: SysUserDto) {
  return request<R<any>>('system/user', {
    method: 'PUT',
    data: body,
  });
}

export async function del(body: SysUserVo) {
  return request<R<any>>(`system/user/${body.userId}`, {
    method: 'DELETE',
  });
}

export function getScope(body: SysUserVo) {
  return request<R<SysUserScopeVo>>(`/api/system/user/scope/${body.id}`, {
    method: 'get',
  });
}

export function putScope(body: SysUserScopeDto) {
  return request(`system/user/scope/${body.userId}`, {
    method: 'put',
    data: body,
  });
}

export function changePassword(body: SysUserPassDto) {
  return request(`system/user/pass/${body.userId}`, {
    method: 'put',
    data: { ...body, confirmPass: body.pass },
  });
}

export function updateStatus(uIds: any[], status: 1 | 0) {
  return request(`system/user/status`, {
    method: 'put',
    params: { status },
    data: uIds,
  });
}
