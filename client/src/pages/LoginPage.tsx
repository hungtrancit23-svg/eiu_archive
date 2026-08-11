import React from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  theme,
  Divider,
  Space,
  Splitter,
  Layout,
  Grid,
  message,
  Typography,
} from "antd";
import type { FormProps } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;
const { Text, Title, Paragraph, Link } = Typography;

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const LoginPage: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const screens = useBreakpoint();
  const [form] = Form.useForm<FieldType>();
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      await authService.login(values.username!, values.password!);
      navigate("/dashboard");
    } catch (error) {
      form.setFields([
        { name: "username", errors: ["Thông tin đăng nhập không chính xác!"] },
        { name: "password", errors: ["Thông tin đăng nhập không chính xác!"] },
      ]);
    }
  };

  const renderLoginForm = () => (
    <Card style={{ margin: "auto", border: 0 }}>
      <Title level={4}>Welcome Back!</Title>
      <Paragraph>Sign in to access to dashboard and finding resources.</Paragraph>
      <Form
        form={form}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="on"
        layout="vertical"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button block type="primary" htmlType="submit" size="large">
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>Or</Divider>

      <Space
        direction="vertical"
        size="middle"
        style={{ display: "flex", alignItems: "center", width: "100%" }}
      >
        {/* Nút đăng nhập Google mới lấy đúng idToken */}
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              if (credentialResponse.credential) {
                await authService.googleLogin(credentialResponse.credential);
                message.success("Đăng nhập Google thành công!");
                navigate("/dashboard");
              }
            } catch (error) {
              message.error("Đăng nhập Google thất bại trên Server!");
            }
          }}
          onError={() => {
            message.error("Đăng nhập Google thất bại!");
          }}
        />

        <Text>
          Don't have an Account?{" "}
          <Link onClick={() => navigate("/register")}>Sign up</Link>
        </Text>
      </Space>
    </Card>
  );

  if (!screens.md) {
    return (
      <Card style={{ margin: "auto", border: 0 }}>
        <div
          style={{
            background: "#144069",
            textAlign: "center",
            padding: "16px 24px",
            borderRadius: borderRadiusLG,
            marginBottom: 24,
          }}
        >
          <Title style={{ fontSize: "48px", color: "#ffffff" }}>EIU Archive</Title>
          <Title style={{ fontSize: "24px", color: "#efb31d" }}>Learn. Share. Inherit.</Title>
        </div>
        {renderLoginForm()}
      </Card>
    );
  }

  return (
    <Layout style={{ width: "100%", height: "100vh" }}>
      <Splitter>
        <Splitter.Panel resizable={false} style={{ background: colorBgContainer, display: "flex" }}>
          {renderLoginForm()}
        </Splitter.Panel>
        <Splitter.Panel resizable={false} style={{ background: "#144069", display: "flex" }}>
          <div style={{ margin: "auto", textAlign: "center" }}>
            <Title style={{ fontSize: "48px", color: "#ffffff" }}>EIU Archive</Title>
            <Title style={{ fontSize: "24px", color: "#efb31d" }}>Learn. Share. Inherit.</Title>
          </div>
        </Splitter.Panel>
      </Splitter>
    </Layout>
  );
};

export default LoginPage;