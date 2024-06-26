import { user, organization } from '@/services/atreus/system';
import {
  Avatar,
  Button,
  Col,
  Dropdown,
  Form,
  Menu,
  message,
  Popconfirm,
  Row,
  TreeSelect,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import Page from '@/components/Page';
import { ProFormText } from '@ant-design/pro-form';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import UrlUtils from '@/utils/UrlUtils';
import { DictBadge, DictSelect, DictTag } from '@/components/Dict';
import type { FormStatus, ModalFormRef } from '@/components/Form';
import { FormDictRadio } from '@/components/Form';
import SelectRole from './SelectRole';
import Auth from '@/components/Auth';
import {
  DeleteOutlined,
  DownOutlined,
  InfoOutlined,
  LockOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import OrganizationTree from './OrganizationTree';
import TreeUtils from '@/utils/TreeUtils';
import React from 'react';
import Grant from './Grant';

export default () => {
  const tableRef = useRef<ActionType>();
  const formRef = useRef<ModalFormRef<SysUserDto>>();

  const [treeData, setTreeData] = useState<any[]>([]);
  const [oIds, setOIds] = useState<number[]>([]);

  const [status, setStatus] = useState<FormStatus>(undefined);
  const [grateVisible, setgrateVisible] = useState(false);
  const [grateRecord, setGrateRecord] = useState<SysUserVo>();

  const [passVisible, setPassVisible] = useState(false);
  const [passRecord, setPassRecord] = useState<SysUserVo>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [avatarData, setAvatarData] = useState<SysUserVo>();

  const dataColumns: ProColumns<SysUserVo>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      align: 'center',
      order: 2,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      align: 'center',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      align: 'center',
      hideInSearch: true,
      render: (dom, record) => {
        return (
          <span onClick={() => setAvatarData(record)}>
            <Avatar
              alt="avatar"
              shape="square"
              size="large"
              style={{ cursor: 'pointer' }}
              icon={<UserOutlined />}
              src={UrlUtils.resolveImage(record.avatar)}
            />
          </span>
        );
      },
    },
    {
      title: '性别',
      dataIndex: 'gender',
      align: 'center',
      hideInSearch: true,
      render: (dom, record) => {
        return <DictTag code="gender" value={record.gender} />;
      },
    },
    {
      title: '组织',
      dataIndex: 'organizationName',
      align: 'center',
      hideInSearch: true,
    },
    {
      title: '电话',
      dataIndex: 'phoneNumber',
      align: 'center',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      align: 'center',
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: '80px',
      order: 1,
      render: (dom, record) => <DictBadge code="user_status" value={record.status} />,
      renderFormItem: () => <DictSelect allowClear code="user_status" />,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      hideInSearch: true,
      width: '150px',
      sorter: true,
    },
  ];

  const loadTreeData = useCallback(() => {
    setTreeData([]);
    organization.query({}).then((res) => {
      const tree = TreeUtils.toTreeData(res.data.results as unknown as any[], (item) => {
        return { ...item, label: item.name, value: item.id };
      });
      setTreeData(tree || []);
    });
  }, []);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);




  return (
    <>
      <Row gutter={14}>
        <Col md={5}>
          <OrganizationTree
            treeData={treeData}
            reload={() => loadTreeData()}
            value={oIds}
            onChange={setOIds}
          />
        </Col>
        <Col md={19}>
          <Page.Modal<SysUserVo, SysUserQo, SysUserDto>
            {...user}
            title="系统用户"
            rowKey="id"
            columns={dataColumns}
            tableRef={tableRef}
            formRef={formRef}
            handlerData={(body, st) => {
              if (st === 'create') {
                return { ...body, password: body.pass };
              }
              return body;
            }}
            operateBar={[
              (dom, record) => {
                const items: MenuProps['items'] = [
                  {
                    key: '1',
                    label: (
                      <Auth
                        // permission="system:user:edit"
                        render={() => (
                          <a onClick={() =>
                            formRef.current?.edit(record as unknown as SysUserDto)
                          }
                          >编辑
                          </a>
                        )}
                      />
                    ),
                  },
                  {
                    key: '2',
                    label: (
                      <Auth
                        key={`user-grant-auth-${record.userId}`}
                        permission="system:user:grant"
                        render={() => (
                          <a
                            onClick={() => {
                              setGrateRecord(record);
                              setgrateVisible(true);
                            }}
                          >
                            授权
                          </a>
                        )}
                      />
                    ),
                  },
                  {
                    key: '3',
                    label: (
                      <Auth
                        key={`user-pass-auth-${record.userId}`}
                        // permission="system:user:pass"
                        render={() => (
                          <a
                            onClick={() => {
                              setPassRecord(record);
                              setPassVisible(true);
                            }}
                          >
                            改密
                          </a>
                        )}
                      />
                    ),
                  },
                  {
                    key: '4',
                    danger: true,
                    label: (
                      <Auth
                        key={`user-del-auth-${record.userId}`}
                        permission="system:user:del"
                        render={() => (
                          <Popconfirm
                            key="user-del-popconfirm"
                            title={`确认要删除吗?`}
                            overlayStyle={{ width: '150px' }}
                            onConfirm={() => {
                              user.del(record).then(() => {
                                message.success('删除成功!');
                                tableRef.current?.reload();
                              });
                            }}
                          >
                            <a style={{ color: 'red' }}>删除</a>
                          </Popconfirm>
                        )}
                      />),
                  },
                ];
                return (
                  <Dropdown
                    key={`user-operte-${record.userId}`}
                    menu={{ items }}
                  >
                    <a style={{ userSelect: 'none' }}>操作</a>
                  </Dropdown>
                );
              },
            ]}
            operateBarProps={{ width: 70 }}
            toolBarActions={[
              selectedRowKeys && selectedRowKeys.length > 0 ? (
                <Dropdown
                  overlay={
                    <Menu
                      key="multiple-dropdown"
                      onClick={({ key }) => {
                        user.updateStatus(selectedRowKeys, key === 'open' ? 1 : 0).then(() => {
                          message.success('操作成功!');
                          tableRef.current?.reload();
                        });
                      }}
                    >
                      <Menu.Item key="open">
                        <DeleteOutlined style={{ marginRight: '10px' }} />
                        开启
                      </Menu.Item>
                      <Menu.Item key="lock">
                        <LockOutlined style={{ marginRight: '10px' }} />
                        锁定
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button>
                    批量操作
                    <DownOutlined style={{ marginLeft: '5px' }} />
                  </Button>
                </Dropdown>
              ) : (
                <></>
              ),

              { type: 'create', permission: 'system:user:add' },
            ]}
            tableProps={{
              params: {
                // @ts-ignore
                organizationId: oIds && oIds.length > 0 ? oIds.join(',') : undefined,
              },
              rowSelection: {
                fixed: true,
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => {
                  setSelectedRowKeys(keys);
                },
                alwaysShowAlert: true,
              },
              tableAlertOptionRender: false,
              tableAlertRender: () => {
                return (
                  <>
                    <InfoOutlined style={{ color: '#1890ff', marginRight: 5, fontSize: 14 }} />
                    已选择: <span style={{ color: '#1890ff' }}>{selectedRowKeys.length}</span>
                    <a onClick={() => setSelectedRowKeys([])} style={{ marginLeft: '24px' }}>
                      清空
                    </a>
                  </>
                );
              },
            }}
            formProps={{ titleSuffix: '用户' }}
            onStatusChange={setStatus}
          >
            <Row>
              <Col xs={24} sm={24} md={12}>
                <ProFormText name="userId" hidden />
                <ProFormText
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名!' }]}
                />

                {status === 'edit' ? (
                  <></>
                ) : (
                  <ProFormText.Password
                    name="pass"
                    label="密码"
                    rules={[{ required: true, message: '请输入密码!' }]}
                  />
                )}

                <ProFormText
                  name="nickname"
                  label="昵称"
                  rules={[{ required: true, message: '请输入昵称!' }]}
                />

                <Form.Item name="organizationId" label="组织">
                  <TreeSelect treeData={treeData} />
                </Form.Item>

                <FormDictRadio
                  name="status"
                  label="状态"
                  code="user_status"
                  initialValue={1}
                  dictProps={{ radioType: 'button' }}
                />
              </Col>

              <Col xs={24} sm={24} md={12}>
                <FormDictRadio
                  name="gender"
                  label="性别"
                  code="gender"
                  dictProps={{ radioType: 'button' }}
                  initialValue={1}
                />

                <ProFormText name="phoneNumber" label="电话" />

                <ProFormText name="email" label="邮箱" />

                {status === 'edit' ? (
                  <></>
                ) : (
                  <Form.Item name="roleCodes" label="角色" initialValue={[]}>
                    <SelectRole />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Page.Modal>
        </Col>
      </Row>
      <Grant visible={grateVisible} onVisibleChange={setgrateVisible} record={grateRecord} />

    </>
  );
};
