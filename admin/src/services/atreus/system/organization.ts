import type { R } from '@/typings';
import { request } from 'umi';
import type { SysOrganizationDto, SysOrganizationQo, SysOrganizationVo } from './typings';

export async function query(body?: Partial<SysOrganizationQo>) {
  return request<R<SysOrganizationVo[]>>('/api/system/organization/tree', {
    method: 'POST',
    data: body,
  });
}

export async function create(body: SysOrganizationDto) {
  return request<R<any>>('/api/system/organization/create', {
    method: 'POST',
    data: body,
  });
}

export async function edit(body: SysOrganizationDto) {
  return request<R<any>>('system/organization', {
    method: 'PUT',
    data: body,
  });
}

export async function del(body: SysOrganizationVo) {
  return request<R<any>>(`system/organization/${body.id}`, {
    method: 'DELETE',
  });
}

export function revised() {
  return request('/system/organization/revised', {
    method: 'patch',
  });
}
