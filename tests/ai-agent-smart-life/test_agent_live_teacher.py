"""Unit tests for genuine Responses function-calling classroom demonstration.
No external API call or student data is used.
"""
import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[2] / "public/ai-agent-smart-life/project/agent_live_teacher.py"
spec = importlib.util.spec_from_file_location("agent_live_teacher", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TeacherAgentTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.csv = Path(self.tmp.name) / "study_scores.csv"
        self.csv.write_text("subject,score\nMath,70\nEnglish,90\nScience,80\n", encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def test_read_and_stats(self):
        rows = module.read_data(self.csv)
        self.assertEqual(len(rows), 3)
        stats = module.call_tool("score_stats", {}, self.csv)
        self.assertEqual(stats["average"], 80)
        self.assertEqual(stats["lowest"]["subject"], "Math")
        plan = module.call_tool("study_plan", {}, self.csv)
        self.assertTrue(plan["verified"])
        self.assertEqual(plan["plan"][0]["subject"], "Math")

    def test_forbidden_and_unexpected_arguments(self):
        with self.assertRaises(ValueError):
            module.call_tool("delete_file", {}, self.csv)
        with self.assertRaises(ValueError):
            module.call_tool("read_scores", {"path":"/etc/passwd"}, self.csv)

    def test_invalid_score_and_duplicates(self):
        self.csv.write_text("subject,score\nMath,-5\n", encoding="utf-8")
        with self.assertRaises(ValueError):
            module.read_data(self.csv)
        self.csv.write_text("subject,score\nMath,70\nMath,90\n", encoding="utf-8")
        with self.assertRaises(ValueError):
            module.read_data(self.csv)
        self.csv.write_text("subject,score\nMath,nan\n", encoding="utf-8")
        with self.assertRaises(ValueError):
            module.read_data(self.csv)

    def test_demo_agent_runs_all_tool_calls(self):
        result = module.run_agent(module.fake_client(), self.csv)
        self.assertEqual([x["tool"] for x in result["traces"]],
                         ["read_scores","score_stats","study_plan"])
        self.assertIn("가상 자료 분석 완료", result["answer"])

    def test_strict_no_data_without_tool(self):
        def no_tool_client(_payload):
            return {"output":[{"type":"message",
                                "content":[{"type":"output_text","text":"근거 없는 요약"}]}]}
        with self.assertRaises(RuntimeError):
            module.run_agent(no_tool_client, self.csv)

    def test_reject_absurd_tool_arguments_from_model(self):
        def attacker_client(_payload):
            if not hasattr(attacker_client,"called"):
                attacker_client.called=True
                return {"output":[{"type":"function_call","name":"read_scores",
                                   "arguments":'{"path":"/etc/passwd"}',"call_id":"invalid-1"}]}
            return {"output":[{"type":"message",
                                "content":[{"type":"output_text","text":"검증 후 종료"}]}]}
        result=module.run_agent(attacker_client,self.csv)
        self.assertIn("error",result["traces"][0]["result"])


if __name__ == "__main__":
    unittest.main()
