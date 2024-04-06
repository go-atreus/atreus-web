import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'Atreus Admin',
          title: 'Atreus Admin',
          href: 'https://github.com/go-atreus',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/go-atreus',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
