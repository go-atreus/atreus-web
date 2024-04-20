import { useEffect, useRef } from 'react';
import { Form, message } from 'antd';
import type { SysUserScopeDto, SysUserVo } from '@/services/atreus/system';
import { user } from '@/services/atreus/system';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ModalForm, ProFormText } from '@ant-design/pro-form';
import SelectRole from './SelectRole';

type GrantProps = {
  visible: boolean;
  onVisibleChange: (val: boolean) => void;
  record?: SysUserVo;
};

export default ({ visible, onVisibleChange, record }: GrantProps) => {
  const formRef = useRef<ProFormInstance<SysUserScopeDto>>();

  useEffect(() => {
    formRef.current?.resetFields();
    if (record) {
      user.getScope(record).then(({ data }) => {
        formRef.current?.setFieldsValue({
          id: record.id,
          username: record.username,
          roleCodes: data.roles,
        });
      });
    }
  }, [record]);

  return (
    <ModalForm
      title="授权"
      open={visible}
      formRef={formRef}
      onOpenChange={onVisibleChange}
      onFinish={(values) => {
        return user
          .putScope({
            userId: values.userId,
            roleCodes: values.roleCodes,
          })
          .then(() => {
            message.success('授权成功!');
            formRef.current?.resetFields();
            return true;
          });
      }}
    >
      <ProFormText hidden name="id" />
      <ProFormText disabled name="username" label="用户名" />

      <Form.Item name="roleCodes" label="角色" initialValue={[]}>
        <SelectRole />
      </Form.Item>
    </ModalForm>
  );
};
