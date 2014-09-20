Imports System.Data
Imports System.Data.OleDb
Imports clsConsSel
Imports System.Diagnostics

Partial Class _Default
    Inherits System.Web.UI.Page
    Dim cls As New clsConsSel

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        'btnContinue.Attributes.Add("onclick", "return confirm('Are you sure you want to save this survey?');")

        'Clear out any previous submittal session variables

        If Not IsPostBack Then
            'populate the Agency dropdown list with all current Agencies
            Dim ds2 As New DataSet
            ds2 = cls.GetAgencies()
            DropDownList1.DataSource = ds2.Tables(0)
            DropDownList1.DataTextField = ds2.Tables(0).Columns("Agency").ColumnName.ToString()
            DropDownList1.DataValueField = ds2.Tables(0).Columns("Agency").ColumnName.ToString()
            DropDownList1.DataBind()

            'populate the Division dropdown list with Divisions related to the selected Agency
            Dim ds3 As New DataSet
            ds3 = cls.GetDivisions(DropDownList1.SelectedValue)
            DropDownList2.DataSource = ds3.Tables(0)
            DropDownList2.DataTextField = ds3.Tables(0).Columns("Division").ColumnName.ToString()
            DropDownList2.DataValueField = ds3.Tables(0).Columns("Division").ColumnName.ToString()
            DropDownList2.DataBind()

            'populate the gridview with locations related to the selected Division
            Dim ds4 As New DataSet
            ds4 = cls.GetLocations(DropDownList1.SelectedValue, DropDownList2.SelectedValue)
            GridView1.DataSource = ds4.Tables(0)
            GridView1.DataBind()

            Dim ds5 As New DataSet
            ds5 = cls.GetAgencyComments(DropDownList1.SelectedValue)
            If Not IsDBNull(ds5.Tables(0).Rows(0).Item(0)) Then TextBox2.Text = ds5.Tables(0).Rows(0).Item(0)
            If Not IsDBNull(ds5.Tables(0).Rows(0).Item(1)) Then TextBox3.Text = ds5.Tables(0).Rows(0).Item(1)
            If Not IsDBNull(ds5.Tables(0).Rows(0).Item(2)) Then txtFName.Text = ds5.Tables(0).Rows(0).Item(2)
            If Not IsDBNull(ds5.Tables(0).Rows(0).Item(3)) Then txtLName.Text = ds5.Tables(0).Rows(0).Item(3)
        End If



    End Sub
    Protected Sub DropDownList1_SelectedIndexChanged(ByVal sender As Object, ByVal e As System.EventArgs) Handles DropDownList1.SelectedIndexChanged
        'Try
        'If a new Agency is selected from the dropdown, repopulate the Division dropdown with related Divisions
        Dim ds3 As New DataSet
        ds3 = cls.GetDivisions(DropDownList1.SelectedValue)
        DropDownList2.DataSource = ds3.Tables(0)
        DropDownList2.DataTextField = ds3.Tables(0).Columns("Division").ColumnName.ToString()
        DropDownList2.DataValueField = ds3.Tables(0).Columns("Division").ColumnName.ToString()
        DropDownList2.DataBind()

        'and repopulate the gridview with Locations related to the selected Division
        Dim ds4 As New DataSet
        ds4 = cls.GetLocations(DropDownList1.SelectedValue, DropDownList2.SelectedValue)
        GridView1.DataSource = ds4.Tables(0)
        GridView1.DataBind()
        Label3.Text = "&nbsp;"

        Dim ds5 As New DataSet
        ds5 = cls.GetAgencyComments(DropDownList1.SelectedValue)
        If Not IsDBNull(ds5.Tables(0).Rows(0).Item(0)) Then
            TextBox2.Text = ds5.Tables(0).Rows(0).Item(0)
        Else
            TextBox2.Text = ""
        End If
        If Not IsDBNull(ds5.Tables(0).Rows(0).Item(1)) Then
            TextBox3.Text = ds5.Tables(0).Rows(0).Item(1)
        Else
            TextBox3.Text = ""
        End If
        If Not IsDBNull(ds5.Tables(0).Rows(0).Item(2)) Then
            txtFName.Text = ds5.Tables(0).Rows(0).Item(2)
        Else
            txtFName.Text = ""
        End If
        If Not IsDBNull(ds5.Tables(0).Rows(0).Item(3)) Then
            txtLName.Text = ds5.Tables(0).Rows(0).Item(3)
        Else
            txtLName.Text = ""
        End If


    End Sub

    Protected Sub DropDownList2_SelectedIndexChanged(ByVal sender As Object, ByVal e As System.EventArgs) Handles DropDownList2.SelectedIndexChanged
        'if a different Division is selected from the dropdown, repopulate the gridview 
        'with Locations related to the newly selected Division
        Dim ds4 As New DataSet
        ds4 = cls.GetLocations(DropDownList1.SelectedValue, DropDownList2.SelectedValue)
        GridView1.DataSource = ds4.Tables(0)
        GridView1.DataBind()
        Label3.Text = "&nbsp;"
    End Sub

    Public Function GetCheckBoxValues(ByVal intObjectID, ByVal strCheckBox) As Boolean
        'Pass in the primary key value and the checkbox field name to create the sql to pull the checkbox value
        Dim myconn As New OleDb.OleDbConnection(cls.getConnectionString())
        Dim strSQL As String

        strSQL = "SELECT SurveyInput." & strCheckBox & " FROM(SurveyInput) WHERE (((SurveyInput.OBJECTID)= " & intObjectID & "))"
        Dim da As OleDbDataAdapter = New OleDbDataAdapter(strSQL, myconn)

        Dim ds As New DataSet
        da.Fill(ds, "checkdata")
        Dim blnCheckBoxValue As Boolean
        blnCheckBoxValue = ds.Tables(0).Rows(0).Item(0)

        Return blnCheckBoxValue

    End Function
    'Public Function GetTimeFrameValue(ByVal intObjectID) As String
    '    'Set the selected value for the time frame needed dropdown
    '    Dim myconn As New OleDb.OleDbConnection(cls.getConnectionString())
    '    Dim strSQL As String

    '    strSQL = "SELECT SurveyInput.TimeFrameNeeded FROM(SurveyInput) WHERE (((SurveyInput.OBJECTID)= " & intObjectID & "))"
    '    Dim da As OleDbDataAdapter = New OleDbDataAdapter(strSQL, myconn)

    '    Dim ds As New DataSet
    '    da.Fill(ds, "timeframe")

    '    Dim strValue As String
    '    If Not IsDBNull(ds.Tables(0).Rows(0).Item(0)) Then
    '        strValue = ds.Tables(0).Rows(0).Item(0)
    '    Else
    '        strValue = "NA"
    '    End If

    '    Return strValue

    'End Function
    Public Function GetTextBoxValues(ByVal intObjectID, ByVal intTextBox) As String
        Dim myconn As New OleDb.OleDbConnection(cls.getConnectionString())
        Dim strSQL As String

        If intTextBox = 1 Then
            strSQL = "SELECT SurveyInput.Desktops FROM(SurveyInput) WHERE (((SurveyInput.OBJECTID)= " & intObjectID & "))"
        ElseIf intTextBox = 2 Then
            strSQL = "SELECT SurveyInput.EstimatedCostPerMonth FROM(SurveyInput) WHERE (((SurveyInput.OBJECTID)= " & intObjectID & "))"
        ElseIf intTextBox = 3 Then
            strSQL = "SELECT SurveyInput.DesktopsFuture FROM(SurveyInput) WHERE (((SurveyInput.OBJECTID)= " & intObjectID & "))"
        End If

        Dim da As OleDbDataAdapter = New OleDbDataAdapter(strSQL, myconn)

        Dim ds As New DataSet
        da.Fill(ds, "desktops")
        Dim TextBoxValue As String
        If Not IsDBNull(ds.Tables(0).Rows(0).Item(0)) Then
            TextBoxValue = ds.Tables(0).Rows(0).Item(0)
        Else
            TextBoxValue = ""
        End If

        Return TextBoxValue

    End Function
    Protected Sub btnContinue_Click(ByVal sender As Object, ByVal e As System.EventArgs) Handles btnContinue.Click

        ' Loop through the rows of the GridView control
        ' to get the category number and selected consultant to store in the new datatable
        ' For each record in the gridview also get the Company ID, RFP, ITEM and Date of this submittal
        Dim myconn As New OleDb.OleDbConnection(cls.getConnectionString())
        If myconn.State <> ConnectionState.Open Then
            myconn.Open()
        End If

        Dim intNumEstimatedSites As Integer
        If IsNumeric(TextBox3.Text) Then
            intNumEstimatedSites = CInt(TextBox3.Text)
        Else
            Label3.Text = "You must enter a number from 0 to 32,000 in the 'NOMADIC sites for this agency' box."
            myconn.Close()
            myconn = Nothing
            Exit Sub
        End If
        If Len(Trim(txtFName.Text)) = 0 Or Len(Trim(txtLName.Text)) = 0 Then
            Label3.Text = "You must enter your first and last name."
            myconn.Close()
            myconn = Nothing
            Exit Sub
        End If

        For Each row As GridViewRow In GridView1.Rows

            Dim intObjectID As Integer = CType(row.FindControl("HiddenField1"), HiddenField).Value
            Dim blnCurrNotConnected As Boolean = CType(row.FindControl("Checkbox1"), CheckBox).Checked
            Dim blnCurrConnT1 As Boolean = CType(row.FindControl("Checkbox2"), CheckBox).Checked
            Dim blnCurrConnDSL As Boolean = CType(row.FindControl("Checkbox3"), CheckBox).Checked
            Dim blnCurrConnCable As Boolean = CType(row.FindControl("Checkbox4"), CheckBox).Checked
            Dim blnCurrConnSatellite As Boolean = CType(row.FindControl("Checkbox5"), CheckBox).Checked
            Dim blnCurrConnDialup As Boolean = CType(row.FindControl("Checkbox6"), CheckBox).Checked
            Dim blnCurrConnWifi As Boolean = CType(row.FindControl("Checkbox21"), CheckBox).Checked
            Dim blnCurrConnOther As Boolean = CType(row.FindControl("Checkbox13"), CheckBox).Checked
            Dim blnCurrSatisfied As Boolean = CType(row.FindControl("Checkbox14"), CheckBox).Checked
            Dim strCostPerMonth As String = CType(row.FindControl("Textbox2"), TextBox).Text
            Dim blnNeededForEmail As Boolean = CType(row.FindControl("Checkbox7"), CheckBox).Checked
            Dim blnNeededForWebApps As Boolean = CType(row.FindControl("Checkbox8"), CheckBox).Checked
            Dim blnNeededForVoice As Boolean = CType(row.FindControl("Checkbox9"), CheckBox).Checked
            Dim blnNeededForThinApps As Boolean = CType(row.FindControl("Checkbox10"), CheckBox).Checked
            Dim blnNeededForFatApps As Boolean = CType(row.FindControl("Checkbox11"), CheckBox).Checked
            Dim blnNeededForVideo As Boolean = CType(row.FindControl("Checkbox12"), CheckBox).Checked
            Dim blnNeededForEmailFuture As Boolean = CType(row.FindControl("Checkbox15"), CheckBox).Checked
            Dim blnNeededForWebAppsFuture As Boolean = CType(row.FindControl("Checkbox16"), CheckBox).Checked
            Dim blnNeededForThinAppsFuture As Boolean = CType(row.FindControl("Checkbox17"), CheckBox).Checked
            Dim blnNeededForFatAppsFuture As Boolean = CType(row.FindControl("Checkbox18"), CheckBox).Checked
            Dim blnNeededForVoiceFuture As Boolean = CType(row.FindControl("Checkbox19"), CheckBox).Checked
            Dim blnNeededForVideoFuture As Boolean = CType(row.FindControl("Checkbox20"), CheckBox).Checked
            Dim str1 As String = CType(row.FindControl("Textbox1"), TextBox).Text
            Dim str3 As String = CType(row.FindControl("Textbox4"), TextBox).Text

            Dim int1, int2, int3 As Integer
            If IsNumeric(str1) And IsNumeric(strCostPerMonth) And IsNumeric(str3) Then
                int1 = CInt(str1)
                int2 = CInt(strCostPerMonth)
                int3 = CInt(str3)
            Else
                Label3.Text = "You must enter a number from 0 to 32,000 in the Desktop box(es) and Current Cost Per Month box(es)."
                myconn.Close()
                myconn = Nothing
                Exit Sub
            End If
            Dim strLanID As String = Request.ServerVariables("auth_user")


            Dim cmd As New OleDbCommand("UPDATE [SurveyInput] SET [CurrNotConnected] = " & blnCurrNotConnected & ", [CurrConnT1] = " & blnCurrConnT1 & ", " & _
                                        "[CurrConnDSL] = " & blnCurrConnDSL & ", [CurrConnCable] = " & blnCurrConnCable & ", [CurrSatisfied] = " & blnCurrSatisfied & ",  " & _
                                        "[CurrConnSatellite] = " & blnCurrConnSatellite & ", [CurrConnDialup] = " & blnCurrConnDialup & ", [CurrConnWifi] = " & blnCurrConnWifi & ", [CurrConnOther] = " & blnCurrConnOther & ", " & _
                                        "[EstimatedCostPerMonth] = '" & strCostPerMonth & "', [NeededForEmail] = " & blnNeededForEmail & ", [NeededForEmailFuture] = " & blnNeededForEmailFuture & ",  " & _
                                        "[NeededForWebApps] = " & blnNeededForWebApps & ", [NeededForWebAppsFuture] = " & blnNeededForWebAppsFuture & ", [NeededForVoice] = " & blnNeededForVoice & ", [NeededForVoiceFuture] = " & blnNeededForVoiceFuture & ",  " & _
                                        "[NeededForThinApps] = " & blnNeededForThinApps & ", [NeededForThinAppsFuture] = " & blnNeededForThinAppsFuture & ", [NeededForFatApps] = " & blnNeededForFatApps & ", [NeededForFatAppsFuture] = " & blnNeededForFatAppsFuture & ",  " & _
                                        "[NeededForVideo] = " & blnNeededForVideo & ", [NeededForVideoFuture] = " & blnNeededForVideoFuture & ", [Desktops] = " & int1 & ", [DesktopsFuture] = " & int3 & _
                                        ", [LAN_ID] = '" & strLanID & "' " & _
                                        "WHERE [OBJECTID] = " & intObjectID, myconn)

            cmd.ExecuteNonQuery()

        Next

        Dim cmd2 As New OleDbCommand("UPDATE [SurveyAgencies] SET [AgencyComments] = '" & TextBox2.Text & "', [EstimatedNomadicSites] = " & intNumEstimatedSites & ", [SurveyorFName] = '" & txtFName.Text & "', [SurveyorLName] = '" & txtLName.Text & "' WHERE [AgencyName] = '" & Replace(DropDownList1.SelectedValue, "'", "''") & "'", myconn)
        cmd2.ExecuteNonQuery()

        myconn.Close()
        myconn = Nothing



        Label3.Text = "Survey has been saved to the database - " & Now
    End Sub
End Class