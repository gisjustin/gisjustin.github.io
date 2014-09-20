<%@ Page Language="VB" AutoEventWireup="false" CodeFile="Default.aspx.vb" Inherits="_Default" masterpagefile="~/MasterPage.master" Title="Wireless Survey"%>

<asp:Content ID="defaulted" ContentPlaceHolderID="MasterPageContentPlaceHolder" runat="server">

        <table width="100%">
          <tr>
            <td><asp:Label ID="Label3" runat="server" Text="&nbsp;" Font-Bold="true" Font-Size="Large" ForeColor="Red"></asp:Label></td>
            <td align="right"></td>
          </tr>
        </table>
    <asp:Label ID="Label12" runat="server" Text="&nbsp;" Width="100%" Font-Bold="true" Font-Size="Large" ForeColor="Red"></asp:Label><br />
    <asp:Label ID="Label6" runat="server" Text="<b>First Name:</b>"></asp:Label>
    <asp:TextBox ID="txtFName" runat="server"></asp:TextBox> &nbsp; &nbsp; 
    <asp:Label ID="Label7" runat="server" Text="<b>Last Name:</b>"></asp:Label>
    <asp:TextBox ID="txtLName" runat="server"></asp:TextBox><br /><br /><br />
    
      <table cellpadding="0" cellspacing="0" id="TABLE1" width="850">
          <tr>
            <td>
              <asp:Label ID="Label1" runat="server" Text="<b>Select an Agency:</b>"></asp:Label><br /><br /><br />
            </td>
            <td>
              <asp:DropDownList ID="DropDownList1" runat="server" AutoPostBack="True"></asp:DropDownList><br /><br /><br />
            </td>
            <td rowspan="2" align="center"><b>Enter Agency Comments:</b><br />
                <asp:TextBox  ID="TextBox2" runat="server" TextMode="MultiLine" Height="100%" Rows="4" Columns="35" MaxLength="300" EnableViewState="true"></asp:TextBox>
            </td>
          </tr>
          <tr>
            <td>
              <asp:Label ID="Label2" runat="server" Text="<b>Select a District or Division:</b>"></asp:Label>
            </td>
            <td>
              <asp:DropDownList ID="DropDownList2" runat="server" AutoPostBack="True"></asp:DropDownList>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              (Complete all selections for your agency)
            </td>
          </tr>
       </table>
        <br /><br />
    <asp:Label ID="Label4" runat="server" Text="Please notify <a href='mailto:COMMSURV@indot.in.gov'>COMMSURV@indot.in.gov</a> of any missing sites.  Please provide agency, site name, and address."></asp:Label>
        <br />
        <br />
    &nbsp;<table cellpadding="0" cellspacing="0"  border="1" style="background-color: white;" id="TABLE2" ">
<tr style="font-size: x-small;" >
<td width="98" align="center">Location</td>
<td width="458" align="center">Current Connection(s)<br />(Check all that apply)</td>
<td width="73" align="center">Current Cost Per Month (Actual)</td>
<td width="305" align="center">
    <strong><span style="font-size: 11pt">Needs </span></strong>(check all that apply)<br /><img alt="Current Future Image" src="images/CurrentFuture.gif" width="150" height="40" /></td>
<td width="50" align="center"># of Desk Top PCs</td>
</tr>
</table>

        <asp:GridView ID="GridView1" runat="server" AutoGenerateColumns="False" BorderStyle="Solid" CellPadding="0" HeaderStyle-BorderStyle="Solid" HeaderStyle-BackColor="Beige" BackColor="#DEBA84" BorderColor="#DEBA84" BorderWidth="1px" Font-Size="Smaller" RowStyle-BorderColor="Black" RowStyle-HorizontalAlign="Center" RowStyle-VerticalAlign="Middle" >
            <Columns>
                <asp:TemplateField Visible="False">
                    <ItemTemplate>
                        <asp:HiddenField ID="HiddenField1" runat="server" Value='<%# Eval("OBJECTID") %>' Visible="false" />  
                    </ItemTemplate>
                 </asp:TemplateField>
                <asp:BoundField DataField="Remote_Location" SortExpression="Remote_Location">
                    <HeaderStyle HorizontalAlign="Center" VerticalAlign="Middle" />
                    <ItemStyle HorizontalAlign="Center" Width="100px" />
                </asp:BoundField>
                <asp:TemplateField HeaderText="T1">
                    <ItemTemplate>
                        <asp:CheckBox checked = '<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnT1") %>' ID="CheckBox2" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" VerticalAlign="Middle" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="DSL">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnDSL") %>'  ID="CheckBox3" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="Cable">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnCable") %>'  ID="CheckBox4" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="Satellite">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnSatellite") %>'  ID="CheckBox5" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="Dial Up">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnDialup") %>'  ID="CheckBox6" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="WiFi Pre- WiMAX">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnWifi") %>'  ID="CheckBox21" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<span title='Give details in Agency Comments.'>Other</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrConnOther") %>'  ID="CheckBox13" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
               <asp:TemplateField HeaderText="Not Connected">
                    <ItemTemplate>
                        <asp:CheckBox checked = '<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrNotConnected") %>' ID="CheckBox1" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                   <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
               <asp:TemplateField HeaderText="Satisfied? Checked = Yes">
                    <ItemTemplate>
                        <asp:CheckBox checked = '<%# GetCheckBoxValues(Eval("OBJECTID"),"CurrSatisfied") %>' ID="CheckBox14" runat="server" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                   <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField>
                    <ItemTemplate>
                        $<asp:TextBox Value = '<%# GetTextBoxValues(Eval("OBJECTID"),2) %>' ID="TextBox2" runat="server" Width="45px" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="75px" />
                </asp:TemplateField>
                 <asp:TemplateField HeaderText="<span title='The term e-mail (as a noun or verb) applies both to the Internet e-mail system based on the Simple Mail Transfer Protocol (SMTP) and to intranet systems allowing users within one organization to e-mail each other. Often these workgroup collaboration organizations may use the Internet protocols for internal e-mail service.'>Email</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForEmail") %>'  ID="CheckBox7" runat="server" /><br /><hr />
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForEmailFuture") %>'  ID="CheckBox15" runat="server" BackColor="Yellow" />
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                     <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<span title='An application that is accessed with a Web browser over a network such as the Internet or an intranet. Examples of Web Apps include people-soft, MapQuest, Online banking….'>Web Apps</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForWebApps") %>'  ID="CheckBox8" runat="server" /><br /><hr />
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForWebAppsFuture") %>'  ID="CheckBox16" runat="server" BackColor="Yellow" />

                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<span title='A thin client is a minimal client. Thin clients use as few resources on the host computer as possible. The job of a thin client is generally just to graphically display information provided by an application server, which performs the bulk of any required data processing.'>Thin Client</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForThinApps") %>'  ID="CheckBox10" runat="server" /><br /><hr />
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForThinAppsFuture") %>'  ID="CheckBox17" runat="server" BackColor="Yellow" />

                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<span title='A client that performs the bulk of any data processing operations itself but does not necessarily rely on the server.'>Fat Client</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForFatApps") %>'  ID="CheckBox11" runat="server" /><br /><hr />
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForFatAppsFuture") %>'  ID="CheckBox18" runat="server" BackColor="Yellow" />

                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<span title='Also called VoIP, IP Telephony, Internet telephony, Broadband telephony, Broadband Phone and Voice over Broadband is the routing of voice conversations over the Internet or through any other IP-based network.'>Voice</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForVoice") %>'  ID="CheckBox9" runat="server" /><br /><hr />
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForVoiceFuture") %>'  ID="CheckBox19" runat="server" BackColor="Yellow" />

                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<span title=''>Video</span>">
                    <ItemTemplate>
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForVideo") %>'  ID="CheckBox12" runat="server" /><br /><hr />
                        <asp:CheckBox checked ='<%# GetCheckBoxValues(Eval("OBJECTID"),"NeededForVideoFuture") %>'  ID="CheckBox20" runat="server" BackColor="Yellow" />

                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                    <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
               <asp:TemplateField>
                    <ItemTemplate>
                        <asp:TextBox Value = '<%# GetTextBoxValues(Eval("OBJECTID"),1) %>' ID="TextBox1" runat="server" Width="25px" />&nbsp;<br /><hr />
                        <asp:TextBox Value = '<%# GetTextBoxValues(Eval("OBJECTID"),3) %>' ID="TextBox4" runat="server" Width="25px" BackColor="Yellow" />&nbsp;
                    </ItemTemplate>
                    <HeaderStyle ForeColor="White" />
                   <ItemStyle HorizontalAlign="Center" Width="50px" />
                </asp:TemplateField>
            </Columns>
            <HeaderStyle BackColor="#A55129" BorderStyle="Solid" Font-Bold="True" ForeColor="White" HorizontalAlign="Center" VerticalAlign="Middle" />
            <FooterStyle BackColor="#F7DFB5" ForeColor="#8C4510" />
            <RowStyle BackColor="#FFF7E7" ForeColor="#8C4510" BorderColor="Black" HorizontalAlign="Center" VerticalAlign="Middle" />
            <SelectedRowStyle BackColor="#738A9C" Font-Bold="True" ForeColor="White" />
            <PagerStyle ForeColor="#8C4510" HorizontalAlign="Center" />
            <AlternatingRowStyle BackColor="Tan" />
        </asp:GridView>
    <br />
    <asp:Label ID="Label5" runat="server" Text="Please estimate the number of <span title='Sites that move from place to place rather than remain in one location. Examples of these include INDOT construction trailers, and emergency management trailers.'>'NOMADIC'</span> sites for this agency."></asp:Label>
    <asp:TextBox ID="TextBox3" runat="server" Width="45"></asp:TextBox>
    <br /><br /><br />
        <asp:Label ID="Label11" runat="server" Text="<b>Submit this survey:</b>"></asp:Label>
        <asp:Button ID="btnContinue" runat="server" Text="Update" />
 </asp:Content>
 
