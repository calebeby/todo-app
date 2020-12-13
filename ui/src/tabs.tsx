interface Props {
  active: string
}

const activeStyle = { boxShadow: '0 2px white', fontWeight: 'bold' } as any

export const Tabs = ({ active }: Props) => {
  return (
    <div class="tabs">
      <a href="/week" style={active === '/week' ? activeStyle : {}}>
        Week
      </a>
      <a href="/month" style={active === '/month' ? activeStyle : {}}>
        Month
      </a>
      <a href="/list" style={active === '/list' ? activeStyle : {}}>
        List
      </a>
    </div>
  )
}
