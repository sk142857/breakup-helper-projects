import { Card, Col, Row, Statistic } from 'antd'
import { UserOutlined, ApiOutlined, CheckCircleOutlined } from '@ant-design/icons'

export default function Dashboard() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="用户总数" value={0} prefix={<UserOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="今日 API 调用" value={0} prefix={<ApiOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic title="活跃应用" value={0} prefix={<CheckCircleOutlined />} />
        </Card>
      </Col>
    </Row>
  )
}
